package io.github.markusjx;

import io.github.markusjx.database.DatabaseManager;
import io.github.markusjx.database.databaseTypes.Document;
import io.github.markusjx.database.filter.DocumentFilter;
import io.github.markusjx.database.filter.filters.FilenameFilter;
import io.github.markusjx.database.filter.filters.PropertyFilter;
import io.github.markusjx.database.filter.filters.TagFilter;
import io.github.markusjx.database.filter.filters.dates.DateFilter;
import io.github.markusjx.database.persistence.CustomPersistence;
import io.github.markusjx.database.persistence.SQLiteProvider;
import io.github.markusjx.datatypes.ChainedHashMap;
import org.hibernate.tool.schema.Action;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import java.time.LocalDate;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        SQLiteProvider provider = new SQLiteProvider("", Action.CREATE, true);
        EntityManagerFactory factory = CustomPersistence.createEntityManagerFactory("documents", provider);
        EntityManager entityManager = factory.createEntityManager();
        DatabaseManager manager = new DatabaseManager(entityManager);
        manager.createTag("abc");
        manager.createTag("def");

        manager.createProperty("prop1");
        manager.createProperty("prop2");

        manager.createDocument("n1", "C/n1",
                ChainedHashMap.of("prop1", "val1", "prop2", "val1"),
                LocalDate.now(), "abc", "def");

        List<Document> docs = manager.getDocumentsBy(DocumentFilter.createFilter(
                new TagFilter("abc", "def"),
                new FilenameFilter("1", false),
                new PropertyFilter("prop1", "val1", "prop2", "val1"),
                //new SingleDateFilter(LocalDate.of(2000, 10, 10))
                //DateFilter.today()
                DateFilter.getByDate(2021, 2)
        ), 0);
        System.out.println(docs);
        System.out.println(docs.size());

        entityManager.close();
    }
}
