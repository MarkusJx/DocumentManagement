package cApi;

import cApi.structs.DocumentPointerArray;
import cApi.structs.PropertyValuePointerArray;
import cApi.structs.TagPointerArray;
import database.databaseTypes.Document;
import database.databaseTypes.PropertyValue;
import database.databaseTypes.Tag;
import org.graalvm.nativeimage.c.struct.SizeOf;
import org.graalvm.nativeimage.c.type.CCharPointerPointer;
import org.graalvm.nativeimage.c.type.CTypeConversion;

import java.util.List;

public class TypeConverter {
    public static DocumentPointerArray convertDocumentList(List<Document> documents) {
        DocumentPointerArray res = NativeImported.allocate(SizeOf.get(DocumentPointerArray.class) * documents.size());
        for (int i = 0; i < documents.size(); i++) {
            //documents.get(i).writeToPointer(res.addressOf(i).element());
            NativeImported.copyStringToPointer(res.addressOf(i).element().filename(), Constants.DATABASE_LONG_STRING, documents.get(i).getFilename());
            NativeImported.copyStringToPointer(res.addressOf(i).element().path(), Constants.DATABASE_LONG_STRING, documents.get(i).getPath());
            NativeImported.copyStringToPointer(res.addressOf(i).element().date(), Constants.DATABASE_SHORT_STRING, documents.get(i).getCreationDate().toString());

            res.addressOf(i).element().tags(TypeConverter.convertTagList(documents.get(i).getTags()));
            res.addressOf(i).element().properties(TypeConverter.convertPropertyValueList(documents.get(i).getProperties()));

            res.addressOf(i).element().tags().numElements(documents.get(i).getTags().size());
            res.addressOf(i).element().properties().numElements(documents.get(i).getProperties().size());
        }

        return res;
    }

    public static void freeDocumentArray(DocumentPointerArray arr) {
        //Document doc = new Document();
        for (int i = 0; i < arr.numElements(); i++) {
            //doc.freePointer(arr.addressOf(i).element());
            freeTagArray(arr.addressOf(i).element().tags());
            freePropertyValueArray(arr.addressOf(i).element().properties());
        }

        NativeImported.free(arr);
    }

    public static TagPointerArray convertTagList(List<Tag> tags) {
        TagPointerArray res = NativeImported.allocate(SizeOf.get(TagPointerArray.class) * tags.size());
        for (int i = 0; i < tags.size(); i++) {
            //tags.get(i).writeToPointer(res.addressOf(i).element());
            NativeImported.copyStringToPointer(res.addressOf(i).element().name(), Constants.DATABASE_LONG_STRING, tags.get(i).getName());
        }

        return res;
    }

    public static void freeTagArray(TagPointerArray arr) {
        NativeImported.free(arr);
    }

    public static PropertyValuePointerArray convertPropertyValueList(List<PropertyValue> properties) {
        PropertyValuePointerArray res = NativeImported.allocate(SizeOf.get(PropertyValuePointerArray.class) * properties.size());
        for (int i = 0; i < properties.size(); i++) {
            //properties.get(i).writeToPointer(res.addressOf(i).element());
            if (properties.get(i).getValue() == null || properties.get(i).getProperty() == null) continue;
            NativeImported.copyStringToPointer(res.addressOf(i).element().value(), Constants.DATABASE_LONG_STRING, properties.get(i).getValue());
            NativeImported.copyStringToPointer(res.addressOf(i).element().property().name(), Constants.DATABASE_LONG_STRING, properties.get(i).getProperty().getName());
        }

        return res;
    }

    public static void freePropertyValueArray(PropertyValuePointerArray arr) {
        NativeImported.free(arr);
    }

    protected static String[] cStringArrayToJavaStringArray(CCharPointerPointer arr, int arrLen) {
        String[] res = new String[arrLen];
        for (int i = 0; i < arrLen; i++) {
            res[i] = CTypeConversion.toJavaString(arr.read(i));
        }

        return res;
    }
}
