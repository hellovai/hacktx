#include "sandbox.h"

void * trace_process(void * pid)
{
    pid_t child = atoi((char *) pid);
    long orig_eax, eax;
    int status;
    int callmade = false;
    long opt = PTRACE_O_TRACEFORK;
    long newpid;

    long trace = ptrace(PTRACE_ATTACH,child,NULL,NULL);
    ptrace(PTRACE_SETOPTIONS,child,NULL,opt);
    if(trace == false)
        printf("Attached to %d\n",child);

    while(TRUE) {
        child = waitpid(-1, &status, __WALL);

        if (status >> 16 == PTRACE_EVENT_FORK) {
            ptrace(PTRACE_GETEVENTMSG, child, NULL, (long) &newpid);
            ptrace(PTRACE_SYSCALL, newpid, NULL, NULL);       

            printf("Attached to offspring %ld\n", newpid);  
        }
        else{
            if(WIFEXITED(status))
                printf("Child %d exited\n", child);
        }
        orig_eax = ptrace(PTRACE_PEEKUSER, child, 8 * ORIG_EAX, NULL);
        printf("Child %d: %ld\n", child, orig_eax);
        ptrace(PTRACE_SYSCALL,child, NULL, NULL);
    }  
}

int main(int argc, char const *argv[])
{
    return 0;
}