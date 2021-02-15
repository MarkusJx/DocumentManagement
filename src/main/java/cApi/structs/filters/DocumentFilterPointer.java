package cApi.structs.filters;

import cApi.DatabaseContext;
import org.graalvm.nativeimage.ObjectHandle;
import org.graalvm.nativeimage.c.CContext;
import org.graalvm.nativeimage.c.struct.CField;
import org.graalvm.nativeimage.c.struct.CStruct;
import org.graalvm.word.PointerBase;

@CStruct("document_filter_t")
@CContext(DatabaseContext.class)
public interface DocumentFilterPointer extends PointerBase {
    @CField
    ObjectHandle handle();

    @CField
    void handle(ObjectHandle h);
}
