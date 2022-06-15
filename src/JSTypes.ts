
export type TypeOf<T> = T extends string ? 'string' :
	T extends number ? 'number' :
	T extends boolean ? 'boolean' :
	T extends undefined ? 'undefined' :
	T extends symbol ? 'symbol' :
	T extends bigint ? 'bigint' :
	T extends ((...args: any[]) => any) ? 'function' :
	'object'

export type JsType = TypeOf<any>

export type FromTypeOf<TType extends JsType> = TType extends 'string' ? string :
	TType extends 'number' ? number :
	TType extends 'boolean' ? boolean :
	TType extends 'undefined' ? undefined :
	TType extends 'symbol' ? symbol :
	TType extends bigint ? bigint :
	TType extends 'function' ? ((...args: any[]) => any) :
	(object | null)
