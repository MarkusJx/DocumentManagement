package database.filter;

import database.databaseTypes.Document;

import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Root;

public interface DocumentFilterBase {
    DocumentFilterOperations getFilter(CriteriaBuilder cb, Root<Document> root);

    int getMatches(Document document);
}
