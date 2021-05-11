import {JavaClass, JavaType} from "@markusjx/java";

declare namespace javaTypes {
    class List<T extends JavaType> extends JavaClass {
        size(): Promise<number>;

        sizeSync(): number;

        add(data: T): Promise<void>;

        addSync(data: T): void;

        addAll(data: List<T>): Promise<void>;

        addAllSync(data: List<T>): void;

        get(index: number): Promise<T>;

        getSync(index: number): T;

        toArray(): Promise<T[]>;

        toArraySync(): T[];

        isEmpty(): Promise<boolean>;

        isEmptySync(): boolean;

        contains(value: T): Promise<boolean>;

        containsSync(value: T): boolean;

        clear(): Promise<void>;

        clearSync(): void;

        lastIndexOf(value: T): Promise<number>;

        lastIndexOfSync(value: T): number;

        remove(index: number): Promise<T>;

        removeSync(index: number): T;
    }

    class Arrays extends JavaClass {
        static asList<T extends JavaType>(array: T[]): Promise<List<T>>;

        static asListSync<T extends JavaType>(array: T[]): List<T>;
    }
}

export default javaTypes;