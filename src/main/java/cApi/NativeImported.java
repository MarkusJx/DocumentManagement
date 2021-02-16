package cApi;

import org.graalvm.nativeimage.c.function.CFunction;
import org.graalvm.nativeimage.c.type.CCharPointer;
import org.graalvm.nativeimage.c.type.CTypeConversion;
import org.graalvm.word.PointerBase;

public class NativeImported {
    @CFunction
    protected static native PointerBase malloc(int size);

    @CFunction
    protected static native CCharPointer strcpy_s(CCharPointer dest, int destSize, CCharPointer src);

    @CFunction
    public static native void free(PointerBase ptr);

    @SuppressWarnings("unchecked")
    public static <T extends PointerBase> T allocate(int size) {
        return (T) malloc(size);
    }

    public static void copyStringToPointer(CCharPointer dest, int destSize, CharSequence src) {
        CTypeConversion.CCharPointerHolder holder = CTypeConversion.toCString(src);
        strcpy_s(dest, destSize, holder.get());
    }
}
