export default async function (robonomics) {
  const unsubscribe = await robonomics.onBlock((number) => {
    console.log(`Block: ${number}`);
  });
  return unsubscribe;
}
