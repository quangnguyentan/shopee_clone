import PaymentResultContent from "./PaymentResultContent";

const PaymentResultPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ order_no?: string; status?: string }>;
}) => {
  const params = await searchParams;

  return (
    <PaymentResultContent
      orderNo={params.order_no}
      succeeded={params.status === "success"}
    />
  );
};

export default PaymentResultPage;
