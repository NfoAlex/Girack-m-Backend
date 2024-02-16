//JSONをマージするだけの関数 (https://qiita.com/riversun/items/60307d58f9b2f461082a)
export default function mergeDeeply(target:any, source:any, opts?:{concatArray:boolean}) {
  const isObject = (obj:any) => obj && typeof obj === 'object' && !Array.isArray(obj);
  const isConcatArray = opts && opts.concatArray;
  let result = Object.assign({}, target);
  //ここからメイン（型を調べてから）
  if (isObject(target) && isObject(source)) {
      //一つ一つを調べて追加していく感じ
      for (const [sourceKey, sourceValue] of Object.entries(source)) {
          const targetValue = target[sourceKey];
          if (isConcatArray && Array.isArray(sourceValue) && Array.isArray(targetValue)) {
              result[sourceKey] = targetValue.concat(...sourceValue);
          }
          else if (isObject(sourceValue) && target.hasOwnProperty(sourceKey)) {
              result[sourceKey] = mergeDeeply(targetValue, sourceValue, opts);
          }
          else {
              Object.assign(result, {[sourceKey]: sourceValue});
          }
      }
  }
  return result;
}