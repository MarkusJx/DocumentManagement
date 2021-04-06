package io.github.markusjx.database.filter.filters.dates;

import io.github.markusjx.database.filter.DocumentFilterOperations;
import io.github.markusjx.database.types.Document;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A filter to filter documents by
 * searching for an exact date
 */
public class SingleDateFilter implements DateFilterBase {
    /**
     * The date to search for
     */
    private final LocalDate date;

    /**
     * Create a new SingleDateFilter instance
     *
     * @param date the date to search for
     */
    public SingleDateFilter(LocalDate date) {
        Objects.requireNonNull(date);
        this.date = date;
    }

    /**
     * Get the filter operations
     *
     * @param cb   the criteria builder object
     * @param root the root object
     * @return the filter operations
     */
    @Override
    public DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root) {
        // Return the filter operations
        return new DocumentFilterOperations() {
            @Override
            public Predicate where() {
                // Document.date must match this.date
                return cb.equal(root.get("creationDate"), date);
            }
        };
    }

    /**
     * Get the match accuracy
     *
     * @param document the document object to match
     * @return zero
     */
    @Override
    public int getAccuracy(Document document) {
        // This is more accurate than a range match
        return 0;
    }
}
