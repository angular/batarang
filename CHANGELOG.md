# 0.4.3 (2013-06-26)



## Bug fixes
### instrumentation

* fix injecting a provider with array syntax (354fa541)




# Before...

## Features
### build

* use Grunt for building Batarang (4b584ec3)



## Bug fixes
### instrumentation

* improve perf of serializing models by ignoring $ properties, optimizing derez (d0fa3141)

* fix issue with checking models of root scopes (bae0b604)

* fix instrumenting $get (ce962885)

### model

* fix issue in model pane where the first element of array models is undefined (2da618fd)

### style

* prefix highlight class name (9bb1ebb3)
