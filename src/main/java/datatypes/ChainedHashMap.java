package datatypes;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class ChainedHashMap<K, V> extends HashMap<K, List<V>> {
    public ChainedHashMap() {
        super();
    }

    public void putValue(K key, V value) {
        if (super.containsKey(key)) {
            super.get(key).add(value);
        } else {
            List<V> list = new ArrayList<>();
            list.add(value);
            super.put(key, list);
        }
    }

    public void set(K key, List<V> values) {
        super.put(key, values);
    }
}
