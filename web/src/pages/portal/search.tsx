import { useSearchParams, Link } from 'react-router-dom'
import { PortalLayout } from '@/components/layout/portal-layout'
import { FileText, Search, ArrowRight } from 'lucide-react'

export function SearchPage() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''

    // Mock results based on query for demo purposes
    const getResults = (q: string) => {
        const term = q.toLowerCase()
        const results = []

        if (term.includes('khai sinh')) {
            results.push({
                id: '1',
                title: 'Thủ tục đăng ký khai sinh',
                description: 'Hướng dẫn quy trình, hồ sơ cần thiết để đăng ký khai sinh cho trẻ mới sinh.',
                type: 'guide',
                link: '/portal/guide/birth-reg'
            })
            results.push({
                id: '2',
                title: 'Cấp bản sao trích lục khai sinh',
                description: 'Thủ tục xin cấp lại bản sao giấy khai sinh từ dữ liệu hộ tịch.',
                type: 'service',
                link: '/portal/service/birth-copy'
            })
        }

        if (term.includes('hộ khẩu') || term.includes('ho khau')) {
            results.push({
                id: '3',
                title: 'Thủ tục đăng ký thường trú',
                description: 'Quy trình đăng ký thường trú (nhập khẩu) vào hộ gia đình.',
                type: 'service',
                link: '/portal/service/residence-reg'
            })
            results.push({
                id: '4',
                title: 'Tách hộ khẩu',
                description: 'Hướng dẫn thủ tục tách hộ khẩu cho cá nhân hoặc hộ gia đình.',
                type: 'guide',
                link: '/portal/guide/residence-split'
            })
        }

        if (term.includes('đất') || term.includes('dat')) {
            results.push({
                id: '5',
                title: 'Thủ tục cấp Giấy chứng nhận QSDĐ',
                description: 'Hướng dẫn hồ sơ, trình tự cấp sổ đỏ lần đầu.',
                type: 'service',
                link: '/portal/service/land-cert'
            })
        }

        // Default result if no match
        if (results.length === 0) {
            return []
        }

        return results
    }

    const results = getResults(query)

    return (
        <PortalLayout showSearch={true}>
            <div className="bg-muted/30 min-h-screen pb-12">
                <div className="bg-white border-b py-8 px-4">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-2xl font-bold mb-2">Kết quả tìm kiếm</h1>
                        <p className="text-muted-foreground">
                            Tìm thấy {results.length} kết quả cho từ khóa <span className="font-semibold text-foreground">"{query}"</span>
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
                    {results.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border p-8">
                            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium mb-2">Không tìm thấy kết quả nào</h3>
                            <p className="text-muted-foreground mb-6">
                                Thử tìm kiếm với từ khóa khác hoặc quay lại trang chủ.
                            </p>
                            <Link
                                to="/portal"
                                className="inline-flex items-center text-primary-600 hover:underline"
                            >
                                Về trang chủ
                            </Link>
                        </div>
                    ) : (
                        results.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wide font-medium">
                                                {item.type === 'guide' ? 'Hướng dẫn' : 'Dịch vụ'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-primary-700 hover:underline cursor-pointer mb-2">
                                            <Link to={item.link}>{item.title}</Link>
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            {item.description}
                                        </p>
                                        <Link
                                            to={item.link}
                                            className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline mt-4 font-medium"
                                        >
                                            Xem chi tiết <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </PortalLayout>
    )
}
