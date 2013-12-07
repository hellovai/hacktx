#include <sys/types.h>
#include <sys/ptrace.h>
#include <regs.h>

#include <stdio.h>
#include <stdlib.h>

void * trace_process(void * );