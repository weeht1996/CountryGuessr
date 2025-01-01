import { LineChart, Line, YAxis } from 'recharts';
import { GDPChartDataPoint } from '../types/GDPData';

const TrendChart = ({data}: {data:GDPChartDataPoint[]}) => {

    const minValue = Math.min(...data.map(d => d.value));
    const maxValue = Math.max(...data.map(d => d.value));

    if (!data || data.length === 0) {
        return null;
      }

    return (
        <LineChart
            key={JSON.stringify(data)}
            width={48}
            height={30}
            data={data}
        >
            <YAxis hide domain={[minValue, maxValue]} />
            <Line type="monotone" dataKey="value" stroke="#dc2626"dot={(dotProps: any) => {
                const maxLength = data.length - 1;
                const { index, cx, cy } = dotProps;

                if (index === maxLength && cx && cy) {
                    return (
                        <circle
                            key={`${cx}-${cy}`}
                            cx={cx}
                            cy={cy}
                            r={2}
                            strokeWidth={1}
                            fill="red"
                        />
                    );
                }

                return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={0} fill="transparent" />;
            }}
/>
        </LineChart>
    );
};

export default TrendChart;
