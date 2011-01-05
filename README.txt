Introduction
============
nodes-ed is ECMAScript library for dealing with phylogenetic data.  Currently 
it depends on the YUI3 library:
    http://developer.yahoo.com/yui/3

It doesn't do much yet. 

Features
============

JoinedInputSlider - a YUI3 widget (based off of the YUI3 spinner example) that 
creates a joined input text box and slider that lets the user specify a floating
point number with min and max (and keeps the slider in sync with the input box).

Example
============
See the examples directory.  Note that the examples expect the following 
structure of files where the top directory is the DOCUMENT_ROOT for your html
files:

$DOCUMENT_ROOT/lib/yui3/build/cssfonts/fonts-min.css
$DOCUMENT_ROOT/lib/yui3/build/yui/yui-min.js
$DOCUMENT_ROOT/lib/stacktrace.js
$DOCUMENT_ROOT/lib/nodes-ed.js

Which can be obtained by installing yui3 in $DOCUMENT_ROOT/lib and 
installing stacktrace.js from:
    https://github.com/emwendelin/javascript-stacktrace
to the lib.

Installation
============
The YUI build system requires a fairly recent version of ant. See the README 
displayed at: https://github.com/yui/builder/tree/master/componentbuild
for details on that system. Assuming that you do that, then you can run the 
following:

    $ git clone https://github.com/yui/builder.git
    $ git clone https://github.com/yui/yui2.git
    $ git clone https://github.com/yui/yui3.git
    $ git clone git://github.com/mtholder/nodes-ed.git
    $ cd nodes-ed/src
    $ make
    
Note that build.properties file (which is called by ant which is called by make)
uses a relative path to find the YUI builder dir, so you'll have to use this 
structure or modify your build.properties file (We'll have to take this out of
git control if this need to modify becomes common).

If you have the environmental variable DOCUMENT_ROOT set to the root directory 
that for the html docs that you are serving, then you can use:

    $ make install

to put nodes-ed-min.js into "$DOCUMENT_ROOT/lib"




License
============
New BSD License see LICENSE.txt


Authors
============
See the AUTHORS.txt file.  Contact Mark Holder <mtholder@gmail.com> if you'd
like to get involved!
