package io.github.markusjx.database.filter.filters.dates;

import io.github.markusjx.database.filter.DocumentFilterOperations;
import io.github.markusjx.database.types.Document;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import java.time.LocalDate;
import java.util.Objects;

/**
 * A filter to get all documents that were
 * created between two dates
 */
public class DateRangeFilter implements DateFilterBase {
    /**
     * The start date
     */
    private final LocalDate begin;

    /**
     * The end date
     */
    private final LocalDate end;

    /**
     * Create a new DateRangeFilter instance
     *
     * @param begin the start date
     * @param end   the search end date
     */
    public DateRangeFilter(LocalDate begin, LocalDate end) {
        Objects.requireNonNull(begin);
        Objects.requireNonNull(end);
        this.begin = begin;
        this.end = end;
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
                // Document.date must be between this.begin and this.end
                return cb.between(root.get("creationDate"), begin, end);
            }
        };
    }

    /**
     * Get the accuracy of this filter
     *
     * @param document the document object to match
     * @return one
     */
    @Override
    public int getAccuracy(Document document) {
        // This is not as accurate as a single date filter
        return 1;
    }
}
