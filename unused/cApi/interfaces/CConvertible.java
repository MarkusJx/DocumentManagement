package cApi.interfaces;

import org.graalvm.word.PointerBase;

public interface CConvertible<T extends PointerBase> {
    void writeToPointer(T ptr);

    default void freePointer(T ptr) {
    }
}
