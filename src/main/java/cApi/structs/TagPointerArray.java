package cApi.structs;

import cApi.DatabaseContext;
import cApi.interfaces.PointerArray;
import org.graalvm.nativeimage.c.CContext;
import org.graalvm.nativeimage.c.struct.CField;
import org.graalvm.nativeimage.c.struct.CFieldAddress;
import org.graalvm.nativeimage.c.struct.CStruct;

@CStruct("tag_array_t")
@CContext(DatabaseContext.class)
public interface TagPointerArray extends PointerArray {
    @CFieldAddress
    TagPointer element();

    @CField
    int numElements();

    @CField
    void numElements(int num);

    TagPointerArray addressOf(int index);
}
