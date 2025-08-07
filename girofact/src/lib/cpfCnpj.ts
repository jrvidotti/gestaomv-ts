export const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
export const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/;

export const validarCpf = (cpf: string): boolean => {
	const nums = cpf.replace(/\D/g, "");
	if (nums.length !== 11 || /^(\d)\1{10}$/.test(nums)) return false;

	const calc = (slice: string) =>
		slice
			.split("")
			.reduce(
				(acc, digit, i) =>
					acc + Number.parseInt(digit) * (slice.length + 1 - i),
				0,
			);

	const d1 = calc(nums.slice(0, 9));
	const dv1 = d1 % 11 < 2 ? 0 : 11 - (d1 % 11);

	const d2 = calc(nums.slice(0, 9) + dv1);
	const dv2 = d2 % 11 < 2 ? 0 : 11 - (d2 % 11);

	return dv1 === Number.parseInt(nums[9]) && dv2 === Number.parseInt(nums[10]);
};

export const validarCnpj = (cnpj: string): boolean => {
	const nums = cnpj.replace(/\D/g, "");
	if (nums.length !== 14 || /^(\d)\1{13}$/.test(nums)) return false;

	const calcDigit = (nums: string, weights: number[]) => {
		const sum = nums
			.split("")
			.reduce((acc, digit, i) => acc + Number.parseInt(digit) * weights[i], 0);
		const remainder = sum % 11;
		return remainder < 2 ? 0 : 11 - remainder;
	};

	const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
	const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

	const dv1 = calcDigit(nums.slice(0, 12), weights1);
	const dv2 = calcDigit(nums.slice(0, 12) + dv1, weights2);

	return dv1 === Number.parseInt(nums[12]) && dv2 === Number.parseInt(nums[13]);
};
