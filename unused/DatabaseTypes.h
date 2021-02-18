#define DATABASE_LONG_STRING 255
#define DATABASE_SHORT_STRING 30

typedef struct tag_s {
    char name[DATABASE_LONG_STRING];
} tag_t;

typedef struct property_s {
    char name[DATABASE_LONG_STRING];
} property_t;

typedef struct property_value_s {
    char value[DATABASE_LONG_STRING];
    property_t property;
} property_value_t;

typedef struct tag_array_s {
    tag_t element;
    int numElements;
} tag_array_t;

typedef struct property_value_array_s {
    property_value_t element;
    int numElements;
} property_value_array_t;

typedef struct document_s {
    char filename[DATABASE_LONG_STRING];
    char path[DATABASE_LONG_STRING];
    tag_array_t *tags;
    property_value_array_t *properties;
    char date[DATABASE_SHORT_STRING];
} document_t;

typedef struct document_array_s {
    document_t *element;
    int numElements;
} document_array_t;

typedef struct {
    void *handle;
} document_filter_base_t;

typedef struct {
    void *handle;
} document_filter_t;
