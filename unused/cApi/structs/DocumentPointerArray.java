package cApi.structs;

import cApi.DatabaseContext;
import cApi.interfaces.PointerArray;
import org.graalvm.nativeimage.c.CContext;
import org.graalvm.nativeimage.c.struct.CField;
import org.graalvm.nativeimage.c.struct.CFieldAddress;
import org.graalvm.nativeimage.c.struct.CStruct;

@CStruct("document_array_t")
@CContext(DatabaseContext.class)
public interface DocumentPointerArray extends PointerArray {
    @CFieldAddress
    DocumentPointer element();

    @CField
    int numElements();

    @CField
    void numElements(int num);

    DocumentPointerArray addressOf(int index);
}
