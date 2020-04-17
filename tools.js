// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = function filterFileList (rootName, result, targetDirNames, unReadDirNames) {
    //读取文件夹---->下一层目录list
    let paths = fs.readdirSync(rootName);

    //过滤指定文件夹以及子目录
    if (targetDirNames)
        paths = paths.filter(_path =>
            targetDirNames.some(tdpath => path.resolve(rootName, _path).indexOf(tdpath) > -1),
        );

    //去除指定文件夹以及子目录
    if (unReadDirNames && unReadDirNames.includes(rootName)) return;

    //逐个读取文件夹下一层目录，并在读取到文件夹时递归，直到读取到文件为止
    for (let i = 0; i < paths.length; i++) {
        const _path = paths[i];
        const _stats = fs.lstatSync(path.resolve(rootName, _path));
        //console.log(path.resolve(rootName, _path), _stats.isDirectory(), _stats.size == 0);
        if (_stats.isDirectory()) {
            const subPaths = filterFileList(path.resolve(rootName, _path), result, targetDirNames, unReadDirNames);
            //console.log('sub_paths', sub_paths);
        } else if (_stats.size == 0) {
            result.push(path.resolve(rootName, _path));
        } else if (_stats.isFile) {
            //console.log('file_path', path.resolve(rootName, _path));
            result.push(path.resolve(rootName, _path));
        }
    }
    //console.log(result);
    return result;
};
