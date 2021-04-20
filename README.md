# DocumentManagement

A (somewhat) simple database based document management system built using Hibernate and React

## Getting Started

* Start the program
* Create a new database using the "Create Database" option
* Select a database provider to store the data in, e.g. SQLite and configure the database
    * If an SQLite database is selected, the database file must be created
    * For any other database provider, the database connection details must be entered
* Select a directory to scan and store the data from in the database

## Loading a database

### From any existing (supported) database

Select the 'Load a database' option in the main menu and follow the instructions on-screen. You may need to select the
database file to load or enter the login credentials to your database.

### From a recently used database

Any information used to connect to a database in the past will be stored, so the database can be loaded without entering
any credentials. You may need to enter your credentials, since the database password
(only applies to databases using passwords)
will be stored on your local hard drive, encrypted using Microsoft Passport (on Windows). In order to access this
information, you may need to enter your windows login credentials (maybe a pin or authenticate via biometrics). The
information to encrypt any passwords will be stored for 5 minutes. After that time, the credentials must be re-entered,
if a database should be loaded or created.

To load a recently used database, just select the 'Load a recently used database' from the main menu. A new page will
appear, displaying all databases ever used. To load a database, press the 'Load' button. To forget a database, press the
'Remove' button.

If you want to load your most recently used database on startup, select this option in the settings. You may need to
enter your Windows login credentials on startup, if required.

## Editing document properties

The properties of a document can be changed by pressing the edit button in the main data table next to the document to
edit.

At the top of the file editor, you can find the document properties, such as the file name, the path to the file and a
message showing whether the document was found on the current machine with the current settings.

To save any changes, press the 'ok' button at the bottom of the dialog. To revert any changes, press the 'cancel' button
at the bottom of the dialog.

### Tagging

In the file editor dialog, enter a tag name you want to add to the document and press enter to add the tag to the list
of tags to add. If you want to remove a tag from the document, just press the 'close' icon on the tag chip, which are
displayed at the top of the tag selector text field.

### Property names and values

In the file editor dialog, enter a property name and value to add a property name and value. To add another property
name and value set, press the 'Create new' button below the property setter. To delete a property name and value set,
press the 'remove' button below the property setter to remove. If the property name and value set to remove is the last
one to remove, the fields will just be cleared.

### Document creation date

It is also possible to set the file creation date. By default, this will be the date when the file was created. To
change the value, use the time picker at the bottom of the file editor dialog. No changes will be made to the file. If
the creation date value is empty, the value will be ignored.

## Searching for documents

To start a document search, press the search button in the top app bar.
**Note:** All selectable fields are optional. If no fields are set, all documents will be returned.

### File names

In order to search for files by their name, enter a file name to search for. To search for a file by its exact name,
check the 'Exact match' checkbox. If a fuzzy search should be executed, don't check the exact match checkbox. You may
add asterisks to the file name to search for (a percent sign would also be acceptable, defined by the SQL language,
which your request is translated to), like this:

* ``*file*`` will match ``some_file.txt`` but also ``file.png`` or just ``file``
* ``file*`` will match ``file.txt`` but not ``any_file.txt``
* ``*.txt`` will match all files with the suffix ``.txt`` (or all text files)

### Any other properties

Select tags and properties just like when adding properties to a document. Additionally, a range of dates can be
selected between which the document must be created (or the creation date manually set to that value).

**Note:** If any of the selected properties do not exist, no documents will be found. If a single tag does not exist, an
exclamation mark will appear next to the tag name. If a property name and/or value does not exist, this will be
displayed below the specific text field. To search for a document by a property name and value, both values must be set,
if not, the set value will be ignored. If a property name and value combination does not exist, no warning will be
issued.

### Starting the search

Just press the 'Search' button. Duh.

## Advanced features

### Synchronizing the database

If you want to synchronize the database with yor file system, use the menu in the main screen (after loading a database)
and select the 'Synchronize' option from the list. You will then be guided through the process.

Here are a few notes:

* No data will be edited on your system
* You must select a valid directory to sync with
* It may be a good idea to back up the database before doing this
* Any documents removed from the system will be removed from the database
* Any documents previously not existing in the database will be added to the database

### Migrating the database

If you want to copy the whole database to another one, select the
'Copy database' option in the menu. You must select a database to copy the data to. If the database contains any data,
it will be overwritten
(or at least the required tables). The path of the selected root directory will be written to the database.

This process may take a long time.

### Setting the root directory

If a database was created on a different machine with the root directory being located on another path as on your
machine, or the root directory was moved, you may want to set the location of the root directory manually.

Just select the 'Set root directory' option in the menu and follow the instructions.
**Note:** The selected information will be stored on your local machine, not in the database.

## Building yourself

### Requirement

* Node.js version 14
* npm installed
* Some kind of C++ compiler that is able to compile node native addons
* CMake + make on linux
* Visual Studio Build Tools on Windows, if you want Microsoft Passport support
  (more information can be found [here](https://github.com/MarkusJx/node-ms-passport#build-requirements)).

### Build steps

* Clone this repository:

```shell
git clone https://github.com/MarkusJx/DocumentManagement
```

* Install all dependencies:

```shell
npm install
```

* Start the program:

```shell
npm start
```

* Package the project:

```shell
npm run pack
```

## License

The project is licensed under the [GNU General Public License v3.0](LICENSE).

Additional third party licenses can be found in the [licenses](licenses) directory.