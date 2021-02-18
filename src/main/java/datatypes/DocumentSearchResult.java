package datatypes;

import database.databaseTypes.Document;
import database.filter.DocumentFilterBase;

import java.util.List;

/**
 * A document search result
 */
public final class DocumentSearchResult implements Comparable<DocumentSearchResult> {
    /**
     * The match accuracy
     */
    public final int accuracy;

    /**
     * The document returned by the search
     */
    public final Document document;

    /**
     * Create a new DocumentSearchResult instance
     *
     * @param document the document
     * @param filters  the filters
     */
    public DocumentSearchResult(Document document, List<DocumentFilterBase> filters) {
        this.document = document;

        // Get the accuracy
        int acc = 0;
        for (DocumentFilterBase f : filters) {
            acc += f.getAccuracy(document);
        }

        this.accuracy = acc;
    }

    @Override
    public int compareTo(DocumentSearchResult o) {
        return accuracy - o.accuracy;
    }
}
