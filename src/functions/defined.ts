export const defined = <T>(t: T): t is NonNullable<T> =>
	t !== null && t !== undefined;
