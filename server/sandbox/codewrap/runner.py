import textwrap
import logging
from codejail.jail_code import jail_code, is_configured, set_limit, LIMITS, configure

def jailpy(code=None, *args, **kwargs):
    """Run `jail_code` on Python."""
    if code:
        code = textwrap.dedent(code)
    return jail_code("python", code, *args, **kwargs)


class runException(Exception):
    def __init__(self, value, output=None):
        self.error = value
        self.output = output
    def __str__(self):
        return repr(self.error)

class JailCodeHelpers(object):
    """Assert helpers for jail_code tests."""
    def setUp(self):
        super(JailCodeHelpers, self).setUp()
        if not is_configured("python"):
            raise SkipTest

    def assertResultOk(self, res, output):
        """Assert that `res` exited well (0), and had no stderr output."""
        if res.stderr != "":
            raise runException("Syntax Error", res.stderr)
        if res.status != 0:
            if res.status == 152:
                raise runException("Time Limit Exceeded")
            if res.status == 9:
                raise runException("Memory Limit Exceeded")
            raise runException("Unexpected error")
        if res.stdout != output:
            raise runException('Your result was incorrect!', res.stdout)


class Runner(JailCodeHelpers):
    """docstring for Runner"""
    def confine(self, runUser):
        set_limit('VMEM', 10000)
        set_limit('CPU', 3)
        set_limit('REALTIME', 3)
        configure("python", "/usr/bin/python", user=runUser)

    def Run(self, userCode, inputStr, outputStr):
        res = jailpy(
            code=userCode,
            stdin=inputStr
        )
        viewInputStr = inputStr
        if len(viewInputStr) > 1000:
            viewInputStr = viewInputStr[:500] + '\n...\n' + viewInputStr[-500:]
        result = {
            'input': viewInputStr
        }
        try:
            self.assertResultOk(res, outputStr)
            result['output'] = res.stdout
        except Exception, e:
            result['error'] = e.error
            if e.output != None:
                result['output'] = e.output
        finally:
            return result
    
    def shrinkToRead(string):
        output = string
        if len(output) > 200:
            output = string[:100] + '\n...\n' + string[-100:]
        return output
