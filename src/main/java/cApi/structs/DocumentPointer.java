package cApi.structs;

import cApi.DatabaseContext;
import org.graalvm.nativeimage.c.CContext;
import org.graalvm.nativeimage.c.struct.AllowNarrowingCast;
import org.graalvm.nativeimage.c.struct.CField;
import org.graalvm.nativeimage.c.struct.CFieldAddress;
import org.graalvm.nativeimage.c.struct.CStruct;
import org.graalvm.nativeimage.c.type.CCharPointer;
import org.graalvm.word.PointerBase;

@CStruct("document_t")
@CContext(DatabaseContext.class)
public interface DocumentPointer extends PointerBase {
    @CFieldAddress
    CCharPointer filename();

    @AllowNarrowingCast
    @CField
    CCharPointer path();

    @CField
    TagPointerArray tags();

    @CField
    PropertyValuePointerArray properties();

    @AllowNarrowingCast
    @CField
    CCharPointer date();

    @CField
    void tags(TagPointerArray p);

    @CField
    void properties(PropertyValuePointerArray p);

    int filename_size = 255;
    int path_size = 255;
    int date_size  = 25;
}
