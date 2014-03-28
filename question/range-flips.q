{
    "details": "<p><var>N</var> disks are placed in a row, indexed 1 to <var>N</var> from left to right.<br>Each disk has a black side and white side. Initially all disks show their white side.</br></p><p>At each turn, two, not necessarily distinct, integers <var>A</var> and <var>B</var> between 1 and <var>N</var> (inclusive) are chosen uniformly at random.<br>All disks with an index from <var>A</var> to <var>B</var> (inclusive) are flipped.</br></p><p>The following example shows the case <var>N</var> = 8. At the first turn <var>A</var> = 5 and <var>B</var> = 2, and at the second turn <var>A</var> = 4 and <var>B</var> = 6.</p><p align=\"center\"><img src=\"project/images/p_430_flips.gif\"/></p><p>Let E(<var>N</var>, <var>M</var>) be the expected number of disks that show their white side after <var>M</var> turns.<br>We can verify that E(3, 1) = 10/9, E(3, 2) = 5/3, E(10, 4) <img alt=\"\u2248\" border=\"0\" height=\"9\" src=\"images/symbol_asymp.gif\" style=\"vertical-align:middle;\" width=\"11\"/> 5.157 and E(100, 10) <img alt=\"\u2248\" border=\"0\" height=\"9\" src=\"images/symbol_asymp.gif\" style=\"vertical-align:middle;\" width=\"11\"/> 51.893.</br></p><p>Find E(10<sup>10</sup>, 4000).<br>Give your answer rounded to 2 decimal places behind the decimal point.</br></p>",
    "folder": "range-flips",
    "level": 1,
    "random": 0.2805986166507346,
    "tags": [],
    "title": "Range flips"
}