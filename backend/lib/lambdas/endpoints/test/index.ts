// TEST EVENT
export async function handler(event: any) {
  console.log(event);
  return {
    status: 200,
    body: JSON.stringify("Success!!"),
  };
}
