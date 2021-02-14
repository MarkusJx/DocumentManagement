package cApi;

import cApi.structs.DocumentPointerArray;
import org.graalvm.nativeimage.IsolateThread;
import org.graalvm.nativeimage.c.CContext;
import org.graalvm.nativeimage.c.function.CEntryPoint;

@CContext(DatabaseContext.class)
public class EntryPoints {
    @SuppressWarnings("unused")
    @CEntryPoint(name = "free_document_list")
    public static void freeDocumentPointerPointer(IsolateThread thread, DocumentPointerArray ptr) {
        TypeConverter.freeDocumentArray(ptr);
    }
}
