Introduction
============
nodes-ed is ECMAScript library for dealing with phylogenetic data.  

It doesn't do much yet. There are some widgets to make it easier to deal with
    groups of numeric inputs, and a demo used for teaching concepts of likelihood
    in phylogenetic contexts.

Features
============

JoinedInputSlider - a YUI3 widget (based off of the YUI3 spinner example) that 
creates a joined input text box and slider that lets the user specify a floating
point number with min and max (and keeps the slider in sync with the input box).


Dependencies
============
nodes-ed.js currently depends on the YUI3 library:
    http://developer.yahoo.com/yui/3
and stacktrace.js from:
    https://github.com/emwendelin/javascript-stacktrace
(the latter is used for logging exceptions).

Note that the examples expect the following structure of files where the top
directory is the DOCUMENT_ROOT for your html files:

$DOCUMENT_ROOT/lib/yui2/build/reset-fonts-grids/reset-fonts-grids.css
$DOCUMENT_ROOT/lib/yui3/build/cssfonts/fonts-min.css
$DOCUMENT_ROOT/lib/yui3/build/yui/yui-min.js
$DOCUMENT_ROOT/lib/stacktrace.js
$DOCUMENT_ROOT/lib/nodes-ed.js

In short, you install yui2, yui3, and stacktrace.js to $DOCUMENT_ROOT/lib, and 
when you do the install of nodes-ed you use the default location for 
make install.


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

Example
============
See the examples directory.
examples/simplest has examples of using each widget in its simplest form.


Testing
============
Tests are written using YUI's yeti system.  Briefly, to get up and running with
the tests you need to:
    1. install node (see http://nodejs.org/  I used version node-v0.2.6.tar.gz)
        in a non-system location. The non-standard install location seems to be
        a requirement of running npm without sudo. I used:

        $ tar xfzv node-v0.2.6.tar.gz
        $ ./configure --prefix=$HOME/local/
        $ make
        $ make install

        Make sure that $HOME/local/bin is on your PATH:
        
        $ export PATH="${PATH}:$HOME/local/bin"
        
    2. install npm (see http://npmjs.org )
        
        $ tar xfzv isaacs-npm-v0.2.14-6-14-g0cec5bf.tar.gz 
        $ cd isaacs-npm-0cec5bf
        $ make 
    
    3. use npm to install yeti:
    
        $ npm install yeti

Then any time that you would like to test you can:
    1. launch yeti is server mode.  I use the following shell script on Mac
        with ~/myman/yeti/redirect.html being a html file that redirects to 
        http://localhost:8000 
        so that I get three browsers to test with.  I use the PID to kill yeti
        when I'm done testing.

        ###############################################################################
        #!/bin/sh
        yeti --server & 
        echo "PID is $!"
        sleep 2
        open -a /Applications/Safari.app ~/myman/yeti/redirect.html 
        open -a /Applications/Firefox.app ~/myman/yeti/redirect.html 
        open -a /Applications/Google\ Chrome.app ~/myman/yeti/redirect.html 
        ################################################################################

    2. run yeti in non-server mode to execute the tests, passing in any html
        file with unit tests that you wish to run:
    
        $ cd nodes-ed/tests
        $ yeti *.html
    
License
============
New BSD License see LICENSE.txt


Authors
============
See the AUTHORS.txt file.  Contact Mark Holder <mtholder@gmail.com> if you'd
like to get involved!
