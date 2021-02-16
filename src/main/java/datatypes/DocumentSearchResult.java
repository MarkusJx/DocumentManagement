package datatypes;

import cApi.interfaces.CConvertible;
import cApi.structs.DocumentPointerArray;
import database.databaseTypes.Document;
import database.filter.DocumentFilterBase;

import java.util.ArrayList;
import java.util.List;

public class DocumentSearchResult extends ChainedHashMap<Integer, Document> implements CConvertible<DocumentPointerArray> {
    public DocumentSearchResult(List<Document> documents, List<DocumentFilterBase> filters) {
        super();
        for (Document document : documents) {
            int numMatches = 0;
            for (DocumentFilterBase f : filters) {
                numMatches += f.getMatches(document);
            }

            super.putValue(numMatches, document);
        }
    }

    public List<Document> getAsSortedList() {
        List<Document> list = new ArrayList<>();
        for (Entry<Integer, List<Document>> e : super.entrySet()) {
            list.addAll(e.getValue());
        }

        return list;
    }

    /*@Override
    public DocumentListPointer convertToPointer() {
        DocumentListPointer ptr = NativeImported.allocate(DocumentListPointer.class);

        List<Document> sorted = this.getAsSortedList();
        ptr.documents(TypeConverter.convertList(sorted, DocumentPointerPointer.class));
        ptr.numDocuments(sorted.size());

        return ptr;
    }

    @Override
    public void freePointer(DocumentListPointer toFree) {
        TypeConverter.freeList(toFree.documents(), toFree.numDocuments(), new Document());
        NativeImported.free(toFree);
    }*/

    @Override
    public void writeToPointer(DocumentPointerArray ptr) {

    }

    @Override
    public void freePointer(DocumentPointerArray ptr) {

    }
}
