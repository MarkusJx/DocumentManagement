package datatypes;

import database.databaseTypes.Document;
import database.filter.DocumentFilterBase;

import java.util.ArrayList;
import java.util.List;

public class DocumentSearchResult extends ChainedHashMap<Integer, Document> {
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
}
