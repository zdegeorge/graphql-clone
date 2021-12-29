const isFunction = (t: unknown): t is () => unknown => typeof t === 'function';

export const extractParentProp = async <TProp>(
	prop: Resolvers.FieldWrapper<TProp>
): Promise<TProp> => {
	if (prop instanceof Promise) {
		const resolved = await prop;

		return resolved;
	}

	if (isFunction(prop)) {
		const resolved = await prop();

		return resolved;
	}

	return prop;
};
