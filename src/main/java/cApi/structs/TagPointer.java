package cApi.structs;

import cApi.DatabaseContext;
import org.graalvm.nativeimage.c.CContext;
import org.graalvm.nativeimage.c.struct.AllowNarrowingCast;
import org.graalvm.nativeimage.c.struct.CField;
import org.graalvm.nativeimage.c.struct.CStruct;
import org.graalvm.nativeimage.c.type.CCharPointer;
import org.graalvm.word.PointerBase;

@CStruct("tag_t")
@CContext(DatabaseContext.class)
public interface TagPointer extends PointerBase {
    @CField
    @AllowNarrowingCast
    CCharPointer name();

    int name_length = 255;
}
