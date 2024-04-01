var str_name = "This+is+a+message+with+spaces,test2";
const decoded = decodeURIComponent((str_name + "").replace(/\+/g, "%20")).split(
  ","
);

console.log(decoded);

if (query) {
  const newQuery = decodeURIComponent((query + "").replace(/\+/g, "%20"));
  result = await Research.find({
    $or: [
      {title: {$regex: newQuery, $options: "i"}},
      {description: {$regex: newQuery, $options: "i"}},
    ],
  });
}
if (tags) {
  const newTags = decodeURIComponent((tags + "").replace(/\+/g, "%20")).split(
    ","
  );
  result = await Research.find({tags: {$in: newTags}});
}
