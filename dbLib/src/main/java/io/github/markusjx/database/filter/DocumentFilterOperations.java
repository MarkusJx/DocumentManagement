package io.github.markusjx.database.filter;

import io.github.markusjx.database.types.Document;

import javax.persistence.criteria.Expression;
import javax.persistence.criteria.Predicate;

/**
 * An interface containing all important operations
 * to filter an object from the database
 */
public interface DocumentFilterOperations {
    /**
     * Get a predicate to add to the where-block
     *
     * @return the predicate, or null, if no predicate should be added
     */
    default Predicate where() {
        return null;
    }

    /**
     * Get an expression where to group the results by
     *
     * @return the expression or null, if the results don't need to be grouped
     */
    default Expression<Document> groupBy() {
        return null;
    }

    /**
     * Get the number of matches this filter should produce.
     * Will be converted to <code>having count(root) >= val</code>,
     * where val is a sum of all <code>havingCountGe()</code> calls
     * of all filters.
     *
     * @return the number of matches this filter produces
     */
    default int havingCountGe() {
        return 0;
    }
}
