#!/usr/bin/env python
import sys, os, shutil
if len(sys.argv) < 2:
    sys.exit('Expecting a component name as the argument (followed by any YUI module requirements)')
dashed_name = sys.argv[1]
requirements = sys.argv[2:]

fn = dashed_name
if not os.path.exists(fn):
    os.mkdir(fn)

fn = os.path.join(dashed_name, 'js')
if not os.path.exists(fn):
    os.mkdir(fn)

fn = os.path.join(dashed_name, 'Makefile')
if not os.path.exists(fn):
    o = open(fn, 'w')
    r = open('subdir.Makefile.suffix', 'rU')
    o.write('COMPONENT_NAME = ' + dashed_name + '\n')
    o.write(r.read())
    o.close()

fn = os.path.join(dashed_name, 'build.properties')
if not os.path.exists(fn):
    o = open(fn, 'w')
    o.write('''# If the 'builder' project is checked out to an alternate location, this
# property should be updated to point to the checkout location.
builddir=../../../builder/componentbuild

# The name of the component. E.g. event, attribute, widget 
component=%(dashed_name)s

# The list of files which should be concatenated to create the component.
# NOTE: For a css component (e.g. cssfonts, cssgrids etc.) use component.cssfiles instead. 
component.jsfiles=%(dashed_name)s.js

# The list of modules this component requires. Used to setup the Y.add module call for YUI 3.
# NOTE: For a css component, this property is not used/required.
# component.use, component.supersedes, component.optional and component.skinnable are other properties which can be defined
component.requires=%(requirements)s
''' % {'dashed_name' : dashed_name, 'requirements' : ', '.join(requirements)})
    o.close()

as_class_name = ''.join([i[0].upper() + i[1:] for i in dashed_name.split('-')])

fn = os.path.join(dashed_name, 'build.xml')
if not os.path.exists(fn):
    o = open(fn, 'w')
    o.write("""<?xml version="1.0" encoding="UTF-8"?>

<project name="%(as_class_name)s" default="local">
    <description>%(as_class_name)s Build File</description>
    <property file="build.properties" />
    <import file="${builddir}/3.x/bootstrap.xml" description="Default Build Properties and Targets" />
</project>
""" % {'as_class_name' : as_class_name})
    o.close()


fn = os.path.join(dashed_name, 'js', dashed_name + '.js')
if not os.path.exists(fn):
    o = open(fn, 'w')
    o.write('\n')
    o.close()
