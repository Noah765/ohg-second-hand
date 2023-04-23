import { fail, type ActionFailure } from '@sveltejs/kit';

type SchemaBuilder = {
	check: <
		T extends { [k: string]: SupportedTypes | undefined },
		F extends string = '',
		N extends string = 'error',
		D extends string = 'data',
		E extends keyof T = never
	>(infos: {
		request: Request;
		schema: { [k in keyof T]: SchemaType<Exclude<T[k], undefined>> };
		errorNames?: '' extends F ? { error?: N; data?: D } : F;
		errorExclude?: E[];
	}) => Promise<
		| {
				data?: undefined;
				error: ActionFailure<
					'' extends F
						? Record<N, string> & Record<D, { [k in Exclude<keyof T, E>]?: FormDataEntryValue }>
						: Record<`${F}Error`, string> & Record<`${F}Data`, { [k in Exclude<keyof T, E>]?: FormDataEntryValue }>
				>;
		  }
		| { data: { [k in keyof T]: T[k] }; error?: undefined }
	>;
	form: <T extends { [k: string]: SupportedTypes }>(schema: { [k in keyof T]: SchemaType<T[k]> }) => Schema<T>;
	string: (error?: { name?: string; missingError?: string }, info?: { required: boolean }) => SchemaTypeString;
	number: (error?: { name?: string; missingError?: string }, info?: { required: boolean }) => SchemaTypeNumber;
	boolean: (error?: { name?: string; missingError?: string }, info?: { required: boolean }) => SchemaTypeBoolean;
};

type SupportedTypes = string | number | boolean;

type Schema<T extends { [k: string]: SupportedTypes }> = { [k in keyof T]: SchemaType<T[k]> };

type SchemaType<T extends SupportedTypes> = {
	_cast: (data: FormDataEntryValue) => T;
	_required: boolean;
	_error?: { name?: string; missingError?: string };
	_functions: ((data: T) => string | [string, string] | void)[];
};
interface SchemaTypeString extends SchemaType<string> {
	min: (characters: number, error?: string) => SchemaTypeString;
	max: (characters: number, error?: string) => SchemaTypeString;
	email: (error?: string) => SchemaTypeString;
}
interface SchemaTypeNumber extends SchemaType<number> {
	int: (error?: string) => SchemaTypeNumber;
	step: (stepSize: number, error?: string) => SchemaTypeNumber;
	min: (number: number, error?: string) => SchemaTypeNumber;
	max: (number: number, error?: string) => SchemaTypeNumber;
}
interface SchemaTypeBoolean extends SchemaType<boolean> {
	true: (error?: string) => SchemaTypeBoolean;
	false: (error?: string) => SchemaTypeBoolean;
}

const EPSILON = 0.000000001;
const schema: SchemaBuilder = {
	async check<
		T extends { [k: string]: SupportedTypes | undefined },
		F extends string = '',
		N extends string = 'error',
		D extends string = 'data',
		E extends keyof T = never
	>(infos: {
		request: Request;
		schema: { [k in keyof T]: SchemaType<Exclude<T[k], undefined>> };
		errorNames?: '' extends F ? { error?: N; data?: D } : F;
		errorExclude?: E[];
	}) {
		const form = await infos.request.formData();

		const relevantFormData: { [k in keyof T]?: FormDataEntryValue } = {};
		let key: keyof T;
		for (key in infos.schema) {
			const data = form.get(key);
			if (data) relevantFormData[key] = data;
		}

		const castedFormData: { [k in keyof T]: Exclude<T[k], undefined> } = Object();
		for (key in infos.schema) {
			const required: boolean = infos.schema[key]._required;
			const relevantData = relevantFormData[key];

			if (!required && !relevantData) continue;

			const error = infos.schema[key]._error;
			const name = (() => {
				if (error?.name) return error.name;
				return `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
			})();

			let result: string | [string, string] | undefined | void;

			if (!relevantData) {
				if (error?.missingError) result = error.missingError;
				else result = `${name} wird benötigt`;
			} else {
				castedFormData[key] = infos.schema[key]._cast(relevantData);
				for (const func of infos.schema[key]._functions) {
					result = func(castedFormData[key]);
				}
			}
			if (result) {
				infos.errorExclude?.forEach((key) => delete relevantFormData[key]);
				return {
					error: fail(400, {
						[typeof infos.errorNames === 'string' ? `${infos.errorNames}Error` : infos.errorNames?.error ?? 'error']:
							typeof result === 'string'
								? result.replace('#', name)
								: typeof error === 'object' && error.name
								? result[0].replace('#', name)
								: result[1],
						[typeof infos.errorNames === 'string' ? `${infos.errorNames}Data` : infos.errorNames?.data ?? 'data']:
							relevantFormData
					} as '' extends F ? Record<N, string> & Record<D, { [k in Exclude<keyof T, E>]?: FormDataEntryValue }> : Record<`${F}Error`, string> & Record<`${F}Data`, { [k in Exclude<keyof T, E>]?: FormDataEntryValue }>)
				};
			}
		}

		return { data: castedFormData };
	},
	form: (schema) => schema,
	string: (error, info) => ({
		_cast: (data) => String(data),
		_required: info?.required ?? true,
		_error: error,
		_functions: [],
		min(characters, error) {
			this._functions.push((data) => {
				if (data.length < characters) return error ?? '# ist zu kurz';
			});
			return this;
		},
		max(characters, error) {
			this._functions.push((data) => {
				if (data.length > characters) return error ?? '# ist zu lang';
			});
			return this;
		},
		email(error) {
			this._functions.push((data) => {
				if (!/^([a-zA-Z0-9_\-\\.]+)@([a-zA-Z0-9_\\-]+)(\.[a-zA-Z]{2,5}){1,2}$/.test(data)) {
					return error ?? ['# ist keine gültige E-Mail-Adresse', 'Die E-Mail-Adresse ist ungültig'];
				}
			});
			return this;
		}
	}),
	number: (error, info) => ({
		_cast(data) {
			const number = Number(data);
			if (isNaN(number)) return 0;
			return number;
		},
		_required: info?.required ?? true,
		_error: error,
		_functions: [],
		int(error) {
			this._functions.push((data) => {
				if (!Number.isInteger(data)) return error ?? '# ist keine Ganzzahl';
			});
			return this;
		},
		step(stepSize, error) {
			this._functions.push((data) => {
				if (data / stepSize - Math.round(data / stepSize) > EPSILON) {
					return error ?? `# muss in ${stepSize}er Schritten angegeben werden`;
				}
			});
			return this;
		},
		min(characters, error) {
			this._functions.push((data) => {
				if (data < characters) return error ?? '# ist zu gering';
			});
			return this;
		},
		max(characters, error) {
			this._functions.push((data) => {
				if (data > characters) return error ?? '# ist zu groß';
			});
			return this;
		}
	}),
	boolean: (error, info) => ({
		_cast: (data) => Boolean(data),
		_required: info?.required ?? true,
		_error: error,
		_functions: [],
		true(error) {
			this._functions.push((data) => {
				if (!data) return error ?? '# ist nicht wahr';
			});
			return this;
		},
		false(error) {
			this._functions.push((data) => {
				if (data) return error ?? '# ist nicht falsch';
			});
			return this;
		}
	})
};

export default schema;
