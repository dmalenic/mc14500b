#!/bin/bash

mkdir -p docs/mc14500-sim
mkdir -p docs/mc14500-sim/programs
rm docs/mc14500-sim/programs/*
cp mc14500-sim/*.* docs/mc14500-sim
cp -r mc14500-sim/programs docs/mc14500-sim/
