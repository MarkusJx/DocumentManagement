package cApi.structs;

import cApi.DatabaseContext;
import org.graalvm.nativeimage.c.CContext;
import org.graalvm.nativeimage.c.struct.CFieldAddress;
import org.graalvm.nativeimage.c.struct.CStruct;
import org.graalvm.nativeimage.c.type.CCharPointer;
import org.graalvm.word.PointerBase;

@CStruct("property_value_t")
@CContext(DatabaseContext.class)
public interface PropertyValuePointer extends PointerBase {
    @CFieldAddress
    CCharPointer value();

    @CFieldAddress
    PropertyPointer property();
}
