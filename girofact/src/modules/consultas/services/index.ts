import { db } from "@/db";
import { DirectDataService } from "./directdata.service";
import { ViaCepService } from "./viacep.service";

// Singletons dos services
export const directDataService = new DirectDataService(db);
export const viaCepService = new ViaCepService();

// Exports das classes
export * from "./directdata.service";
export * from "./viacep.service";
