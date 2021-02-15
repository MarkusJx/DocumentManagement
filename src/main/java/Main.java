import database.DatabaseManager;
import database.filter.DocumentFilter;
import database.filter.filters.FilenameFilter;
import database.filter.filters.PropertyFilter;
import database.filter.filters.TagFilter;
import database.filter.filters.dates.DateFilter;
import datatypes.DocumentSearchResult;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        test();
    }

    public static void test() {
        DatabaseManager.createTag("abc");
        DatabaseManager.createTag("def");

        DatabaseManager.createProperty("prop1");
        DatabaseManager.createProperty("prop2");

        Map<String, String> m = new HashMap<>();
        m.put("prop1", "val1");
        m.put("prop2", "val1");

        DatabaseManager.createDocument("n1", "C/n1",
                m, LocalDate.now(), "abc", "def");

        DocumentSearchResult docs = DatabaseManager.getDocumentBy(DocumentFilter.createFilter(
                new TagFilter("abc", "def"),
                new FilenameFilter("1", false),
                new PropertyFilter("prop1", "val2", "prop2", "val1"),
                //new SingleDateFilter(LocalDate.of(2000, 10, 10))
                //DateFilter.today()
                DateFilter.getByDate(2021, 2)
        ));
        System.out.println(docs);
        System.out.println(docs.size());

        DatabaseManager.close();
    }
}
