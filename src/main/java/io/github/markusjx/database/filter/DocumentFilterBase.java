package io.github.markusjx.database.filter;

import io.github.markusjx.database.databaseTypes.Document;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Root;

public interface DocumentFilterBase {
    /**
     * Get the document filter operations
     *
     * @param cb   the criteria builder object
     * @param root the root object
     * @return the a DocumentFilterOperations class
     */
    DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root);

    /**
     * Get the match accuracy. The higher the value, the less
     * accurate the match is, e.g. if this function returns
     * 0, the document is an exact match for this filter,
     * if this function returns 10, the document has 10
     * more values than this filter.
     *
     * @param document the document object to match
     * @return the accuracy. Must greater or equal to zero
     */
    int getAccuracy(Document document);
}
