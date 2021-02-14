package cApi;

import cApi.interfaces.CConvertible;
import cApi.interfaces.PointerArray;
import cApi.structs.DocumentPointerArray;
import cApi.structs.PropertyValuePointerArray;
import cApi.structs.TagPointerArray;
import database.databaseTypes.Document;
import database.databaseTypes.PropertyValue;
import database.databaseTypes.Tag;
import org.graalvm.word.PointerBase;

import java.util.List;

public class TypeConverter {
    /*public static <R extends PointerArray<X, R>, T extends CConvertible<X>, X extends PointerBase> R convertList(List<T> list, Class<R> clazz) {
        R res = NativeImported.allocate(clazz, list.size());
        for (int i = 0; i < list.size(); i++) {
            list.get(i).writeToPointer(res.addressOf(i).element());
        }

        return res;
    }

    public static <T extends PointerArray<Y, T>, X extends CConvertible<Y>, Y extends PointerBase> void freeList(T toFree, X xInst) {
        for (int i = 0; i < toFree.numElements(); i++) {
            xInst.freePointer(toFree.addressOf(i).element());
        }

        NativeImported.free(toFree);
    }*/

    public static DocumentPointerArray convertDocumentList(List<Document> documents) {
        DocumentPointerArray res = NativeImported.allocate(DocumentPointerArray.class, documents.size());
        for (int i = 0; i < documents.size(); i++) {
            documents.get(i).writeToPointer(res.addressOf(i).element());
        }

        return res;
    }

    public static void freeDocumentArray(DocumentPointerArray arr) {
        Document doc = new Document();
        for (int i = 0; i < arr.numElements(); i++) {
            doc.freePointer(arr.addressOf(i).element());
        }

        NativeImported.free(arr);
    }

    public static TagPointerArray convertTagList(List<Tag> tags) {
        TagPointerArray res = NativeImported.allocate(TagPointerArray.class, tags.size());
        for (int i = 0; i < tags.size(); i++) {
            tags.get(i).writeToPointer(res.addressOf(i).element());
        }

        return res;
    }

    public static void freeTagArray(TagPointerArray arr) {
        NativeImported.free(arr);
    }

    public static PropertyValuePointerArray convertPropertyValueList(List<PropertyValue> properties) {
        PropertyValuePointerArray res = NativeImported.allocate(PropertyValuePointerArray.class, properties.size());
        for (int i = 0; i < properties.size(); i++) {
            properties.get(i).writeToPointer(res.addressOf(i).element());
        }

        return res;
    }

    public static void freePropertyValueArray(PropertyValuePointerArray arr) {
        NativeImported.free(arr);
    }
}
