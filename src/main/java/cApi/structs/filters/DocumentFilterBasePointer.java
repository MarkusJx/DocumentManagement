package cApi.structs.filters;

import cApi.DatabaseContext;
import org.graalvm.nativeimage.ObjectHandle;
import org.graalvm.nativeimage.c.CContext;
import org.graalvm.nativeimage.c.struct.CField;
import org.graalvm.nativeimage.c.struct.CStruct;
import org.graalvm.word.PointerBase;

/**
 * A base class for a document filter pointer
 */
@CStruct("document_filter_base_t")
@CContext(DatabaseContext.class)
public interface DocumentFilterBasePointer extends PointerBase {
    /**
     * Get the java filter object handle
     *
     * @return the object handle
     */
    @CField
    ObjectHandle handle();

    /**
     * Set the java filter object handle
     *
     * @param h the object handle to set
     */
    @CField
    void handle(ObjectHandle h);
}
