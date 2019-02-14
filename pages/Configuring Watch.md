Compiler supports configuring how to watch files and directories using the environment variables.

## Configuring file watching using environment variable `TSC_WATCHFILE`

Option                                         | Description
-----------------------------------------------|----------------------------------------------------------------------
`PriorityPollingInterval`                      | Use `fs.watchFile` but use different polling intervals for source files, config files and missing files
`DynamicPriorityPolling`                       | Use a dynamic queue where in the frequently modified files will be polled at shorter interval and the files unchanged will be polled less frequently
`UseFsEvents`                                  | Use `fs.watch` which uses file system events (but might not be accurate on different OS) to get the notifications for the file changes/creation/deletion. Note that few OS eg. linux has limit on number of watches and failing to create watcher using `fs.watch` will result it in creating using `fs.watchFile`
`UseFsEventsWithFallbackDynamicPolling`        | This option is similar to `UseFsEvents` except on failing to create watch using `fs.watch`, the fallback watching happens through dynamic polling queues (as explained in `DynamicPriorityPolling`)
`UseFsEventsOnParentDirectory`                 | This option watches parent directory of the file with `fs.watch` (using file system events) thus being low on CPU but can compromise accuracy.
default (no value specified)                   | If environment variable `TSC_NONPOLLING_WATCHER` is set to true, watches parent directory of files (just like `UseFsEventsOnParentDirectory`). Otherwise watch files using `fs.watchFile` with `250ms` as the timeout for any file

## Configuring directory watching using environment variable `TSC_WATCHDIRECTORY`

The watching of directory on platforms that dont support recursive directory watching natively in node, is supported through recursively creating directory watcher for the child directories using different options selected by `TSC_WATCHDIRECTORY`. Note that on platforms that support native recursive directory watching (e.g windows) the value of this environment variable is ignored.

Option                                         | Description
-----------------------------------------------|----------------------------------------------------------------------
`RecursiveDirectoryUsingFsWatchFile`           | Use `fs.watchFile` to watch the directories and child directories which is a polling watch (consuming CPU cycles)
`RecursiveDirectoryUsingDynamicPriorityPolling`| Use dynamic polling queue to poll changes to the directory and child directories.
default (no value specified)                   | Use `fs.watch` to watch directories and child directories

## Background

`--watch` implementation of the compiler relies on `fs.watch` and `fs.watchFile` provided by node, both of these methods have pros and cons.

`fs.watch` uses file system events to notify the changes in the file/directory. But this is OS dependent and the notification is not completely reliable and does not work as expected on many OS. Also there could be limit on number of watches that can be created, eg. linux and we could exhaust it pretty quickly with programs that include large number of files. But because this uses file system events, there is not much CPU cycle involved. Compiler typically uses `fs.watch` to watch directories (eg. source directories included by config file, directories in which module resolution failed etc) These can handle the missing precision in notifying about the changes. But recursive watching is supported on only Windows and OSX. That means we need something to replace the recursive nature on other OS.

`fs.watchFile` uses polling and thus involves CPU cycles. But this is the most reliable mechanism to get the update on the status of file/directory. Compiler typically uses `fs.watchFile` to watch source files, config files and missing files (missing file references) that means the CPU usage depends on number of files in the program.
