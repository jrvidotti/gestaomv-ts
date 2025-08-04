import { LoginFailedError, TagoneError } from "./errors";
import { mountOdataQuery } from "./helpers";
import type {
	LoggedClaims,
	OdataFilter,
	OdataOrderBy,
	OdataQuery,
} from "./types";

export type PaginatedResult<T> = {
	data: T[];
	meta: {
		count: number;
		pages: number;
		page: number;
		filter?: OdataFilter;
		sort?: OdataOrderBy;
	};
};

export class TagoneClient {
	static cookieName = "TagOneCookie";
	baseUrl?: string;
	tagoneCookie?: string | null;
	loggedClaims?: LoggedClaims;

	constructor(baseUrl: string, cookie?: string) {
		this.baseUrl = baseUrl;
		this.setCookie(cookie ?? null);
	}

	setCookie(cookie: string | null) {
		this.tagoneCookie = cookie;
	}

	extractCookie(headers: Headers): string | null {
		try {
			return (
				headers
					.get("set-cookie")
					?.split(", ")
					.filter((cookie) => cookie.startsWith(TagoneClient.cookieName))
					.map((cookie) => cookie.split(";")[0])
					.join(";") ?? null
			);
		} catch {
			return null;
		}
	}

	async doLogin(username: string, password: string): Promise<LoggedClaims> {
		const url = `/Usuario/Login(UserName='${username}',PassWord='${password}',Remember=true)`;

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

		try {
			const resp = await fetch(this.baseUrl + url, {
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			await resp.body?.cancel();
			if (resp.status === 200) {
				const cookie = this.extractCookie(resp.headers);

				if (!cookie) {
					throw new LoginFailedError(
						"Login falhou: cookie não encontrado",
						resp.status,
					);
				}
				this.setCookie(cookie!);
			} else {
				throw new LoginFailedError("Login falhou", resp.status);
			}

			return await this.getLoggedClaims();
		} catch (error) {
			clearTimeout(timeoutId);
			throw error;
		}
	}

	async fetch(url: string, init?: RequestInit): Promise<Record<string, never>> {
		const resp = await fetch(this.baseUrl + url, {
			...init,
			headers: {
				"Content-Type": "application/json",
				...(init?.headers ?? {}),
				Cookie: this.tagoneCookie!,
			},
		});
		if (resp.status >= 400) {
			const text = await resp.text();
			console.error("Erro ao efetuar consulta:", text.slice(0, 100));
			throw new TagoneError(
				"Erro ao efetuar consulta",
				resp.status,
				text.slice(0, 50),
			);
		}
		try {
			return await resp.json();
		} catch {
			const text = await resp.text();
			console.error("Erro ao processar resposta:", text);
			throw new TagoneError("Erro ao processar resposta", 500, text);
		}
	}

	async getLoggedClaims(): Promise<LoggedClaims> {
		const url = `/Usuario/GetLoggedClaims`;
		const data = await this.fetch(url);
		this.loggedClaims = {};
		const keys = data["Keys"] as string[];
		const values = data["Values"] as string[];
		for (let i = 0; i < keys.length; i++) {
			if (keys[i]) this.loggedClaims[keys[i]!] = values[i]!;
		}
		return this.loggedClaims;
	}

	async getPaginatedList<T>({
		url,
		odataQuery,
		page = 1,
		pageSize = 10,
	}: {
		url: string;
		odataQuery?: OdataQuery;
		page?: number;
		pageSize?: number;
	}): Promise<PaginatedResult<T>> {
		if (!odataQuery) odataQuery = {};

		odataQuery.$count = true;

		if (pageSize && pageSize >= 0) {
			odataQuery.$top = pageSize;
			odataQuery.$skip = (page - 1) * pageSize;
		}

		const urlQuery = url + (odataQuery ? mountOdataQuery(odataQuery!) : "");

		const data = await this.fetch(urlQuery);

		return {
			data: data.value,
			meta: {
				count: data["@odata.count"],
				pages: Math.ceil(data["@odata.count"] / pageSize),
				page: page,
				filter: odataQuery.$filter,
				sort: odataQuery.$orderby,
			},
		};
	}

	async getList<T>(
		url: string,
		odataQuery: OdataQuery | undefined = undefined,
	): Promise<T[]> {
		return (await this.getPaginatedList<T>({ url, odataQuery, pageSize: -1 }))
			.data;
	}
}
