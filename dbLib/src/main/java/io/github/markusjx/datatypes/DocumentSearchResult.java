package io.github.markusjx.datatypes;

import io.github.markusjx.database.filter.DocumentFilterBase;
import io.github.markusjx.database.types.Document;

import java.util.List;
import java.util.Objects;

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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        DocumentSearchResult that = (DocumentSearchResult) o;
        return accuracy == that.accuracy && Objects.equals(document, that.document);
    }

    @Override
    public int hashCode() {
        return Objects.hash(accuracy, document);
    }
}
