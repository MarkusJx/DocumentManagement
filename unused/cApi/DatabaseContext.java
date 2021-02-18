package cApi;

import org.graalvm.nativeimage.c.CContext;

import java.io.File;
import java.util.Arrays;
import java.util.List;

public class DatabaseContext implements CContext.Directives {
    @Override
    public List<String> getHeaderFiles() {
        File current_dir = new File(new File("").getAbsolutePath());

        return Arrays.asList(
                new IncludeFile(new File(current_dir.getPath(), "DatabaseTypes.h").getAbsolutePath(),
                        IncludeType.LOCAL_FILE).toString(),
                new IncludeFile("stdlib.h", IncludeType.SYSTEM_FILE).toString()
        );
    }

    private enum IncludeType {
        LOCAL_FILE,
        SYSTEM_FILE
    }

    private static class IncludeFile {
        private final String path;
        private final IncludeType type;

        IncludeFile(String path, IncludeType type) {
            this.path = path;
            this.type = type;
        }

        @Override
        public String toString() {
            if (type == IncludeType.LOCAL_FILE) {
                return '\"' + path + '\"';
            } else {
                return '<' + path + '>';
            }
        }
    }
}
