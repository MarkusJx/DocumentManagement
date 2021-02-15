package cApi;

import cApi.structs.DocumentPointerArray;
import cApi.structs.filters.DocumentFilterBasePointer;
import cApi.structs.filters.DocumentFilterPointer;
import database.DatabaseManager;
import database.filter.DocumentFilter;
import database.filter.DocumentFilterBase;
import database.filter.filters.FilenameFilter;
import database.filter.filters.PropertyFilter;
import database.filter.filters.TagFilter;
import database.filter.filters.dates.DateFilter;
import org.graalvm.nativeimage.IsolateThread;
import org.graalvm.nativeimage.ObjectHandles;
import org.graalvm.nativeimage.c.CContext;
import org.graalvm.nativeimage.c.function.CEntryPoint;
import org.graalvm.nativeimage.c.struct.SizeOf;
import org.graalvm.nativeimage.c.type.CCharPointer;
import org.graalvm.nativeimage.c.type.CCharPointerPointer;
import org.graalvm.nativeimage.c.type.CTypeConversion;
import org.graalvm.word.WordFactory;

import java.time.LocalDate;

@SuppressWarnings("unused")
@CContext(DatabaseContext.class)
public class EntryPoints {
    @CEntryPoint(name = "create_tag_filter")
    protected static DocumentFilterBasePointer createTagFilterPointer(IsolateThread thread, CCharPointerPointer filters, int numFilters) {
        try {
            TagFilter f = new TagFilter(TypeConverter.cStringArrayToJavaStringArray(filters, numFilters));
            DocumentFilterBasePointer ptr = NativeImported.allocate(SizeOf.get(DocumentFilterBasePointer.class));
            if (ptr.isNull()) return WordFactory.nullPointer();

            ptr.handle(ObjectHandles.getGlobal().create(f));
            return ptr;
        } catch (Exception e) {
            e.printStackTrace();
            return WordFactory.nullPointer();
        }
    }

    @CEntryPoint(name = "create_filename_filter")
    protected static DocumentFilterBasePointer createFilenameFilterPointer(IsolateThread thread, CCharPointer filename, int exactMatch) {
        try {
            boolean eMatch = CTypeConversion.toBoolean(exactMatch);
            FilenameFilter f = new FilenameFilter(CTypeConversion.toJavaString(filename), eMatch);
            DocumentFilterBasePointer ptr = NativeImported.allocate(SizeOf.get(DocumentFilterBasePointer.class));
            if (ptr.isNull()) return WordFactory.nullPointer();

            ptr.handle(ObjectHandles.getGlobal().create(f));
            return ptr;
        } catch (Exception e) {
            e.printStackTrace();
            return WordFactory.nullPointer();
        }
    }

    @CEntryPoint(name = "create_property_filter")
    protected static DocumentFilterBasePointer createPropertyFilterPointer(IsolateThread thread, CCharPointerPointer properties, int numProperties) {
        try {
            PropertyFilter f = new PropertyFilter(TypeConverter.cStringArrayToJavaStringArray(properties, numProperties));
            DocumentFilterBasePointer ptr = NativeImported.allocate(SizeOf.get(DocumentFilterBasePointer.class));
            if (ptr.isNull()) return WordFactory.nullPointer();

            ptr.handle(ObjectHandles.getGlobal().create(f));
            return ptr;
        } catch (Exception e) {
            e.printStackTrace();
            return WordFactory.nullPointer();
        }
    }

    private static DocumentFilterBasePointer createDateFilterPointer(DateFilter filter) {
        DocumentFilterBasePointer ptr = NativeImported.allocate(SizeOf.get(DocumentFilterBasePointer.class));
        if (ptr.isNull()) return WordFactory.nullPointer();

        ptr.handle(ObjectHandles.getGlobal().create(filter));
        return ptr;
    }

    @CEntryPoint(name = "create_date_filter_by_date_string")
    protected static DocumentFilterBasePointer createDateFilterPointer(IsolateThread thread, CCharPointer begin, CCharPointer end) {
        try {
            LocalDate b = LocalDate.parse(CTypeConversion.toJavaString(begin));
            LocalDate e = null;
            if (end.isNonNull()) {
                e = LocalDate.parse(CTypeConversion.toJavaString(end));
            }

            DateFilter f;
            if (e == null) {
                f = DateFilter.getByDate(LocalDate.parse(CTypeConversion.toJavaString(begin)));
            } else {
                f = DateFilter.getByDate(b, e);
            }

            return createDateFilterPointer(f);
        } catch (Exception e) {
            e.printStackTrace();
            return WordFactory.nullPointer();
        }
    }

    @CEntryPoint(name = "create_date_filter_by_date_numbers")
    protected static DocumentFilterBasePointer createDateFilterPointer(IsolateThread thread, int year, int month, int day) {
        try {
            DateFilter f;
            if (month <= 0) {
                f = DateFilter.getByDate(year);
            } else if (day <= 0) {
                f = DateFilter.getByDate(year, month);
            } else {
                f = DateFilter.getByDate(year, month, day);
            }

            return createDateFilterPointer(f);
        } catch (Exception e) {
            e.printStackTrace();
            return WordFactory.nullPointer();
        }
    }

    @CEntryPoint(name = "create_date_filter_of_today")
    protected static DocumentFilterBasePointer createDateFilterPointer(IsolateThread thread) {
        try {
            return createDateFilterPointer(DateFilter.today());
        } catch (Exception e) {
            e.printStackTrace();
            return WordFactory.nullPointer();
        }
    }

    @CEntryPoint(name = "free_document_filter_element")
    protected static void freeDocumentFilterPointer(IsolateThread thread, DocumentFilterBasePointer pointer) {
        try {
            ObjectHandles.getGlobal().destroy(pointer.handle());
            NativeImported.free(pointer);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @CEntryPoint(name = "create_document_filter")
    protected static DocumentFilterPointer createDocumentFilterPointer(IsolateThread thread) {
        try {
            DocumentFilterPointer ptr = NativeImported.allocate(SizeOf.get(DocumentFilterPointer.class));
            if (ptr.isNull()) return WordFactory.nullPointer();

            ptr.handle(ObjectHandles.getGlobal().create(new DocumentFilter()));
            return ptr;
        } catch (Exception e) {
            e.printStackTrace();
            return WordFactory.nullPointer();
        }
    }

    @CEntryPoint(name = "document_filter_add_filter")
    protected static void documentFilterPointerAddFilter(IsolateThread thread, DocumentFilterPointer dFilterPtr, DocumentFilterBasePointer filterPtr) {
        try {
            DocumentFilter dFilter = ObjectHandles.getGlobal().get(dFilterPtr.handle());
            DocumentFilterBase filter = ObjectHandles.getGlobal().get(filterPtr.handle());

            dFilter.addFilter(filter);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @CEntryPoint(name = "free_document_filter")
    protected static void freeDocumentFilterPointer(IsolateThread thread, DocumentFilterPointer ptr) {
        try {
            ObjectHandles.getGlobal().destroy(ptr.handle());
            NativeImported.free(ptr);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /*@CEntryPoint(name = "get_documents_by_filter")
    protected static DocumentPointerArray getDocumentsByFilter(IsolateThread thread, DocumentFilterPointer filter) {
        try {
            DocumentSearchResult res = DatabaseManager.getDocumentBy(ObjectHandles.getGlobal().get(filter.handle()));
            return TypeConverter.convertDocumentList(res.getAsSortedList());
        } catch (Exception e) {
            e.printStackTrace();
            return WordFactory.nullPointer();
        }
    }*/

    @CEntryPoint(name = "free_document_array")
    protected static void freeDocumentPointerArray(IsolateThread thread, DocumentPointerArray ptr) {
        TypeConverter.freeDocumentArray(ptr);
    }

    @CEntryPoint(name = "close_database_connection")
    protected static void closeDBConnection(IsolateThread thread) {
        try {
            DatabaseManager.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
