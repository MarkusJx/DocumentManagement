package cApi.structs;

import cApi.DatabaseContext;
import cApi.interfaces.PointerArray;
import org.graalvm.nativeimage.c.CContext;
import org.graalvm.nativeimage.c.struct.CField;
import org.graalvm.nativeimage.c.struct.CFieldAddress;
import org.graalvm.nativeimage.c.struct.CStruct;

@CStruct("property_value_array_t")
@CContext(DatabaseContext.class)
public interface PropertyValuePointerArray extends PointerArray {
    @CFieldAddress
    PropertyValuePointer element();

    @CField
    int numElements();

    @CField
    void numElements(int num);

    PropertyValuePointerArray addressOf(int index);
}
